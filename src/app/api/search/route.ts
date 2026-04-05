import { NextRequest, NextResponse } from "next/server";
import {
  searchGoogleForRedditUser,
  fetchRedditPost,
  fetchRedditUserPosts,
  fetchRedditUserComments,
  searchRedditForUser,
  RedditPost,
  RedditComment,
} from "@/lib/reddit";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username || username.trim().length === 0) {
    return NextResponse.json(
      { error: "Username is required" },
      { status: 400 }
    );
  }

  // Sanitize username - only allow alphanumeric, underscores, hyphens
  const sanitized = username.trim().replace(/[^a-zA-Z0-9_-]/g, "");
  if (sanitized.length === 0 || sanitized.length > 50) {
    return NextResponse.json(
      { error: "Invalid username" },
      { status: 400 }
    );
  }

  try {
    let posts: RedditPost[] = [];
    let comments: RedditComment[] = [];

    // Fetch posts and comments in parallel
    const [googleUrls, userComments] = await Promise.all([
      searchGoogleForRedditUser(sanitized, 3),
      fetchRedditUserComments(sanitized, 100),
    ]);

    comments = userComments;

    if (googleUrls.length > 0) {
      // Fetch individual post data from Google results
      const postPromises = googleUrls.map((url) => fetchRedditPost(url));
      const results = await Promise.allSettled(postPromises);
      posts = results
        .filter(
          (r): r is PromiseFulfilledResult<RedditPost | null> =>
            r.status === "fulfilled" && r.value !== null
        )
        .map((r) => r.value!);
    }

    // Also fetch from Reddit user API and merge
    const redditPosts = await fetchRedditUserPosts(sanitized, 100);
    posts = [...posts, ...redditPosts];

    // If still nothing, try search fallback
    if (posts.length === 0) {
      posts = await searchRedditForUser(sanitized);
    }

    // Deduplicate posts by ID
    const seenPosts = new Set<string>();
    posts = posts.filter((post) => {
      if (seenPosts.has(post.id)) return false;
      seenPosts.add(post.id);
      return true;
    });

    // Deduplicate comments by ID
    const seenComments = new Set<string>();
    comments = comments.filter((comment) => {
      if (seenComments.has(comment.id)) return false;
      seenComments.add(comment.id);
      return true;
    });

    return NextResponse.json({
      username: sanitized,
      postCount: posts.length,
      commentCount: comments.length,
      posts,
      comments,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch data. Please try again." },
      { status: 500 }
    );
  }
}
