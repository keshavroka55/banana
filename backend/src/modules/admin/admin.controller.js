import * as adminService from "./admin.service.js";

// Page number from the query string, never below 1.
const readPage = (query) => Math.max(Number.parseInt(query.page, 10) || 1, 1);

// GET /api/admin/stats
export const handleGetStats = async (req, res) => {
    res.json(await adminService.getStats());
};

// GET /api/admin/users?search=&page=
export const handleListUsers = async (req, res) => {
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    res.json(await adminService.listUsers({ search, page: readPage(req.query) }));
};

// GET /api/admin/games?page=
export const handleListGames = async (req, res) => {
    res.json(await adminService.listGames({ page: readPage(req.query) }));
};
