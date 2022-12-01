import type { Request } from "express";

const getLinks = (req: Request, count: number) => {
  const { page = 1, limit = 10 } = req.query;

  const next =
    +page < count / +limit
      ? `${req.protocol}://${req.get("host")}${req.url}?page=${
          +page + 1
        }&limit=${limit as string}`
      : null;
  const previous =
    page > 1
      ? `${req.protocol}://${req.get("host")}${req.url}?page=${
          +page - 1
        }&limit=${limit as string}`
      : null;

  return [next, previous];
};

export default getLinks;
