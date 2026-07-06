const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

export function rateLimit(
  ip: string,
  options: RateLimitOptions = { windowMs: 60000, maxRequests: 30 }
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, {
      count: 1,
      resetAt: now + options.windowMs,
    });
    return { allowed: true, remaining: options.maxRequests - 1 };
  }

  if (record.count >= options.maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: options.maxRequests - record.count };
}

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap) {
    if (now > value.resetAt) rateLimitMap.delete(key);
  }
}, 60000);
