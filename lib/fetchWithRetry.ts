// lib/fetchWithRetry.ts

export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 5,         // how many times to retry
  delay = 5000         // wait 5s between retries
): Promise<any> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url, options);

      if (!res.ok) {
        throw new Error(HTTP error! Status: ${res.status});
      }

      return await res.json();
    } catch (error) {
      console.warn(
        Fetch attempt ${attempt + 1} failed for ${url}: ${error}
      );

      // if last attempt, throw error
      if (attempt === retries - 1) throw error;

      // wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
