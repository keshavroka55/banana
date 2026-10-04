import prisma from "../../prisma.js";
import bcrypt from "bcrypt";

export const getAllUsers = async () => {
  return prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      bio: true,
      avatar: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const getUserById = async (id) => {
  return prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      bio: true,
      avatar: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const createUser = async (data) => {
  const hashedPassword = data.password
    ? await bcrypt.hash(data.password, 10)
    : null;

  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role ?? "player",
      bio: data.bio,
      avatar: data.avatar,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      bio: true,
      avatar: true,
      createdAt: true,
    },
  });
};

export const updateUser = async (id, data) => {
  const updateData = {
    name: data.name,
    email: data.email,
    role: data.role,
    bio: data.bio,
    avatar: data.avatar,
  };

  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  return prisma.user.update({
    where: {
      id,
    },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      bio: true,
      avatar: true,
      emailVerified: true,
      updatedAt: true,
    },
  });
};

export const deleteUser = async (id) => {
  return prisma.user.delete({
    where: {
      id,
    },
  });
};