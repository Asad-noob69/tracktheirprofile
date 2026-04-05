export interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  author: string;
  subreddit: string;
  subreddit_name_prefixed: string;
  score: number;
  num_comments: number;
  url: string;
  permalink: string;
  created_utc: number;
  thumbnail: string;
  is_self: boolean;
  link_flair_text: string | null;
  post_hint?: string;
  preview?: {
    images: Array<{
      source: { url: string; width: number; height: number };
    }>;
  };
}

export interface RedditComment {
  id: string;
  body: string;
  author: string;
  subreddit: string;
  subreddit_name_prefixed: string;
  score: number;
  created_utc: number;
  permalink: string;
  link_title: string;
  link_permalink: string;
}

const REDDIT_USER_AGENT = "TrackTheirProfile/1.0";

/**
 * Search Google Custom Search for Reddit posts by a username (multi-page)
 */
export async function searchGoogleForRedditUser(
  username: string,
  pages = 3
): Promise<string[]> {
  const apiKey = process.env.GOOGLE_CSE_API_KEY;
  const cseId = process.env.GOOGLE_CSE_ID;

  if (!apiKey || !cseId) {
    return [];
  }

  const allUrls: string[] = [];
  const query = encodeURIComponent(`site:reddit.com ${username}`);

  for (let page = 0; page < pages; page++) {
    const start = page * 10 + 1; // Google CSE uses 1-indexed start param
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${query}&num=10&start=${start}`;

    try {
      const res = await fetch(url);
      if (!res.ok) break;

      const data = await res.json();
      if (!data.items || data.items.length === 0) break;

      const pageUrls: string[] = data.items
        .map((item: { link: string }) => item.link)
        .filter(
          (link: string) =>
            link.includes("reddit.com/r/") && link.includes("/comments/")
        );

      allUrls.push(...pageUrls);
    } catch {
      break;
    }
  }

  return allUrls;
}

/**
 * Fetch a Reddit post's data via the JSON API
 */
export async function fetchRedditPost(
  postUrl: string
): Promise<RedditPost | null> {
  try {
    // Clean URL and append .json
    const cleanUrl = postUrl.replace(/\/$/, "");
    const jsonUrl = `${cleanUrl}.json`;

    const res = await fetch(jsonUrl, {
      headers: { "User-Agent": REDDIT_USER_AGENT },
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!data?.[0]?.data?.children?.[0]?.data) return null;

    const post = data[0].data.children[0].data;

    return {
      id: post.id,
      title: post.title,
      selftext: post.selftext || "",
      author: post.author,
      subreddit: post.subreddit,
      subreddit_name_prefixed: post.subreddit_name_prefixed,
      score: post.score,
      num_comments: post.num_comments,
      url: post.url,
      permalink: `https://reddit.com${post.permalink}`,
      created_utc: post.created_utc,
      thumbnail: post.thumbnail,
      is_self: post.is_self,
      link_flair_text: post.link_flair_text,
      post_hint: post.post_hint,
      preview: post.preview,
    };
  } catch {
    return null;
  }
}

/**
 * Fetch user's posts directly from Reddit's user API with pagination
 */
export async function fetchRedditUserPosts(
  username: string,
  limit = 100
): Promise<RedditPost[]> {
  const all: RedditPost[] = [];
  let after: string | null = null;
  const perPage = Math.min(limit, 100);
  let fetched = 0;

  while (fetched < limit) {
    try {
      let url = `https://www.reddit.com/user/${encodeURIComponent(username)}/submitted.json?sort=new&limit=${perPage}&raw_json=1`;
      if (after) url += `&after=${after}`;

      const res = await fetch(url, {
        headers: { "User-Agent": REDDIT_USER_AGENT },
      });

      if (!res.ok) break;

      const data = await res.json();
      if (!data?.data?.children || data.data.children.length === 0) break;

      const posts = data.data.children.map(
        (child: { data: Record<string, unknown> }) => {
          const post = child.data;
          return {
            id: post.id as string,
            title: post.title as string,
            selftext: (post.selftext as string) || "",
            author: post.author as string,
            subreddit: post.subreddit as string,
            subreddit_name_prefixed: post.subreddit_name_prefixed as string,
            score: post.score as number,
            num_comments: post.num_comments as number,
            url: post.url as string,
            permalink: `https://reddit.com${post.permalink as string}`,
            created_utc: post.created_utc as number,
            thumbnail: post.thumbnail as string,
            is_self: post.is_self as boolean,
            link_flair_text: post.link_flair_text as string | null,
            post_hint: post.post_hint as string | undefined,
            preview: post.preview as RedditPost["preview"],
          };
        }
      );

      all.push(...posts);
      fetched += posts.length;
      after = data.data.after;
      if (!after) break;
    } catch {
      break;
    }
  }

  return all;
}

/**
 * Fetch user's comments from Reddit API with pagination
 */
export async function fetchRedditUserComments(
  username: string,
  limit = 100
): Promise<RedditComment[]> {
  const all: RedditComment[] = [];
  let after: string | null = null;
  const perPage = Math.min(limit, 100);
  let fetched = 0;

  while (fetched < limit) {
    try {
      let url = `https://www.reddit.com/user/${encodeURIComponent(username)}/comments.json?sort=new&limit=${perPage}&raw_json=1`;
      if (after) url += `&after=${after}`;

      const res = await fetch(url, {
        headers: { "User-Agent": REDDIT_USER_AGENT },
      });

      if (!res.ok) break;

      const data = await res.json();
      if (!data?.data?.children || data.data.children.length === 0) break;

      const comments = data.data.children.map(
        (child: { data: Record<string, unknown> }) => {
          const c = child.data;
          return {
            id: c.id as string,
            body: (c.body as string) || "",
            author: c.author as string,
            subreddit: c.subreddit as string,
            subreddit_name_prefixed: c.subreddit_name_prefixed as string,
            score: c.score as number,
            created_utc: c.created_utc as number,
            permalink: `https://reddit.com${c.permalink as string}`,
            link_title: (c.link_title as string) || "",
            link_permalink: c.link_permalink
              ? `https://reddit.com${c.link_permalink as string}`
              : "",
          };
        }
      );

      all.push(...comments);
      fetched += comments.length;
      after = data.data.after;
      if (!after) break;
    } catch {
      break;
    }
  }

  return all;
}

/**
 * Fallback: Search Reddit for posts by the username
 */
export async function searchRedditForUser(
  username: string,
  limit = 25
): Promise<RedditPost[]> {
  try {
    const url = `https://www.reddit.com/search.json?q=author:${encodeURIComponent(username)}&sort=new&limit=${limit}&raw_json=1`;

    const res = await fetch(url, {
      headers: { "User-Agent": REDDIT_USER_AGENT },
    });

    if (!res.ok) return [];

    const data = await res.json();
    if (!data?.data?.children) return [];

    return data.data.children
      .filter((child: { kind: string }) => child.kind === "t3")
      .map((child: { data: Record<string, unknown> }) => {
        const post = child.data;
        return {
          id: post.id as string,
          title: post.title as string,
          selftext: (post.selftext as string) || "",
          author: post.author as string,
          subreddit: post.subreddit as string,
          subreddit_name_prefixed: post.subreddit_name_prefixed as string,
          score: post.score as number,
          num_comments: post.num_comments as number,
          url: post.url as string,
          permalink: `https://reddit.com${post.permalink as string}`,
          created_utc: post.created_utc as number,
          thumbnail: post.thumbnail as string,
          is_self: post.is_self as boolean,
          link_flair_text: post.link_flair_text as string | null,
          post_hint: post.post_hint as string | undefined,
          preview: post.preview as RedditPost["preview"],
        };
      });
  } catch {
    return [];
  }
}
