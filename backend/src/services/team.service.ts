import { prisma } from '../utils/prisma';
import {
  NotFoundError,
  AuthorizationError,
  ConflictError,
} from '../utils/errors';
import {
  CreateTeamInput,
  UpdateTeamInput,
  AddMemberInput,
  UpdateMemberRoleInput,
} from '../validators/team.validator';

export class TeamService {
  async getTeams(userId: string) {
    const teams = await prisma.team.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            projects: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return teams;
  }

  async getTeamById(teamId: string, userId: string) {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            avatar: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                email: true,
              },
            },
          },
        },
        projects: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
              },
            },
            tags: true,
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundError('Команда не найдена');
    }

    // Проверка участия
    const isMember = team.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new AuthorizationError('Нет доступа к этой команде');
    }

    return team;
  }

  async createTeam(userId: string, data: CreateTeamInput) {
    const team = await prisma.team.create({
      data: {
        name: data.name,
        description: data.description,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return team;
  }

  async updateTeam(teamId: string, userId: string, data: UpdateTeamInput) {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: true,
      },
    });

    if (!team) {
      throw new NotFoundError('Команда не найдена');
    }

    // Только владелец или админ может редактировать
    const member = team.members.find((m) => m.userId === userId);
    if (!member || (member.role !== 'OWNER' && member.role !== 'ADMIN')) {
      throw new AuthorizationError('Только владелец или администратор может редактировать команду');
    }

    const updated = await prisma.team.update({
      where: { id: teamId },
      data: {
        name: data.name,
        description: data.description,
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return updated;
  }

  async deleteTeam(teamId: string, userId: string) {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundError('Команда не найдена');
    }

    // Только владелец может удалить
    if (team.ownerId !== userId) {
      throw new AuthorizationError('Только владелец может удалить команду');
    }

    await prisma.team.delete({
      where: { id: teamId },
    });

    return { message: 'Команда успешно удалена' };
  }

  async getMembers(teamId: string, userId: string) {
    // Проверка доступа
    await this.getTeamById(teamId, userId);

    const members = await prisma.teamMember.findMany({
      where: { teamId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
            email: true,
            reputation: true,
            level: true,
          },
        },
      },
      orderBy: [
        { role: 'asc' }, // OWNER, ADMIN, MEMBER
        { joinedAt: 'asc' },
      ],
    });

    return members;
  }

  async addMember(teamId: string, userId: string, data: AddMemberInput) {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: true,
      },
    });

    if (!team) {
      throw new NotFoundError('Команда не найдена');
    }

    // Только владелец или админ может добавлять участников
    const member = team.members.find((m) => m.userId === userId);
    if (!member || (member.role !== 'OWNER' && member.role !== 'ADMIN')) {
      throw new AuthorizationError('Только владелец или администратор может добавлять участников');
    }

    // Проверка, не является ли пользователь уже участником
    const existingMember = team.members.find((m) => m.userId === data.userId);
    if (existingMember) {
      throw new ConflictError('Пользователь уже является участником команды');
    }

    // Проверка существования пользователя
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new NotFoundError('Пользователь не найден');
    }

    const newMember = await prisma.teamMember.create({
      data: {
        teamId,
        userId: data.userId,
        role: data.role,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
            email: true,
          },
        },
      },
    });

    return newMember;
  }

  async updateMemberRole(
    teamId: string,
    memberUserId: string,
    currentUserId: string,
    data: UpdateMemberRoleInput
  ) {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: true,
      },
    });

    if (!team) {
      throw new NotFoundError('Команда не найдена');
    }

    // Только владелец может изменять роли
    if (team.ownerId !== currentUserId) {
      throw new AuthorizationError('Только владелец может изменять роли участников');
    }

    // Нельзя изменить роль владельца
    if (memberUserId === team.ownerId) {
      throw new ConflictError('Нельзя изменить роль владельца');
    }

    const member = team.members.find((m) => m.userId === memberUserId);
    if (!member) {
      throw new NotFoundError('Участник не найден');
    }

    const updated = await prisma.teamMember.update({
      where: {
        teamId_userId: {
          teamId,
          userId: memberUserId,
        },
      },
      data: {
        role: data.role,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    return updated;
  }

  async removeMember(teamId: string, memberUserId: string, currentUserId: string) {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: true,
      },
    });

    if (!team) {
      throw new NotFoundError('Команда не найдена');
    }

    // Владелец может удалить любого, админ может удалить только обычных участников
    const currentMember = team.members.find((m) => m.userId === currentUserId);
    if (!currentMember) {
      throw new AuthorizationError('Вы не являетесь участником команды');
    }

    const targetMember = team.members.find((m) => m.userId === memberUserId);
    if (!targetMember) {
      throw new NotFoundError('Участник не найден');
    }

    // Нельзя удалить владельца
    if (memberUserId === team.ownerId) {
      throw new ConflictError('Нельзя удалить владельца команды');
    }

    // Админ не может удалить другого админа или владельца
    if (currentMember.role === 'ADMIN' && targetMember.role !== 'MEMBER') {
      throw new AuthorizationError('Администратор может удалять только обычных участников');
    }

    await prisma.teamMember.delete({
      where: {
        teamId_userId: {
          teamId,
          userId: memberUserId,
        },
      },
    });

    return { message: 'Участник успешно удалён из команды' };
  }
}

export const teamService = new TeamService();

