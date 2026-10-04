import {
    getAllUsers,
    getUserById,
    createUser as createUserService,
    updateUser as updateUserService,
    deleteUser as deleteUserService,
} from "./admin.service.js";

export const getUsers = async (req, res, next) => {
    try {
        const users = await getAllUsers();

        res.status(200).json({
            success: true,
            data: users,
        });
    } catch (error) {
        next(error);
    }
};

export const getUser = async (req, res, next) => {
    try {
        const user = await getUserById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

export const createUser = async (req, res, next) => {
    try {
        const user = await createUserService(req.body);

        res.status(201).json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

export const updateUser = async (req, res, next) => {
    try {
        const user = await updateUserService(
            req.params.id,
            req.body
        );

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        await deleteUserService(req.params.id);

        res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};