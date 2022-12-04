import type { Request } from "express";

const getLinks = (req: Request, count: number, services?: string) => {
  const { page = 1, limit = 10 } = req.query;

  const next =
    +page < count / +limit
      ? `${req.protocol}://${req.get("host")}${req.baseUrl}?page=${
          +page + 1
        }&limit=${limit as string}${services ? `&services=${services}` : ""}`
      : null;
  const previous =
    page > 1
      ? `${req.protocol}://${req.get("host")}${req.baseUrl}?page=${
          +page - 1
        }&limit=${limit as string}${services ? `&services=${services}` : ""}`
      : null;

  return [next, previous];
};

export default getLinks;
