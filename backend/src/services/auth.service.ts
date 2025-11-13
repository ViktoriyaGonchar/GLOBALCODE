import { hashPassword, comparePassword } from '../utils/password';
import { prisma } from '../utils/prisma';
import { generateAccessToken, generateRefreshToken, TokenPayload } from '../utils/jwt';
import {
  AuthenticationError,
  ConflictError,
  NotFoundError,
} from '../utils/errors';
import {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from '../validators/auth.validator';
import { v4 as uuidv4 } from 'uuid';

// В production это должно храниться в Redis или базе данных
const passwordResetTokens = new Map<string, { userId: string; expiresAt: Date }>();
const emailVerificationTokens = new Map<string, { userId: string; expiresAt: Date }>();

export class AuthService {
  async register(data: RegisterInput) {
    // Проверка существования email
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUserByEmail) {
      throw new ConflictError('Пользователь с таким email уже существует');
    }

    // Проверка существования username
    const existingUserByUsername = await prisma.user.findUnique({
      where: { username: data.username },
    });

    if (existingUserByUsername) {
      throw new ConflictError('Пользователь с таким именем уже существует');
    }

    // Хеширование пароля
    const hashedPassword = await hashPassword(data.password);

    // Создание пользователя
    const user = await prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        bio: true,
        reputation: true,
        level: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    // Генерация токенов
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Генерация токена для верификации email
    const emailToken = uuidv4();
    emailVerificationTokens.set(emailToken, {
      userId: user.id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 часа
    });

    // TODO: Отправить email с токеном верификации

    return {
      user,
      accessToken,
      refreshToken,
      emailVerificationToken: emailToken, // В production не возвращать
    };
  }

  async login(data: LoginInput) {
    // Поиск пользователя
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !user.password) {
      throw new AuthenticationError('Неверный email или пароль');
    }

    // Проверка пароля
    const isPasswordValid = await comparePassword(data.password, user.password);

    if (!isPasswordValid) {
      throw new AuthenticationError('Неверный email или пароль');
    }

    // Генерация токенов
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        reputation: user.reputation,
        level: user.level,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    };
  }

  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        bio: true,
        reputation: true,
        level: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('Пользователь не найден');
    }

    return user;
  }

  async refreshToken(refreshToken: string) {
    const { verifyRefreshToken } = await import('../utils/jwt');
    
    try {
      const payload = verifyRefreshToken(refreshToken);
      
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user) {
        throw new AuthenticationError('Пользователь не найден');
      }

      const tokenPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const newAccessToken = generateAccessToken(tokenPayload);
      const newRefreshToken = generateRefreshToken(tokenPayload);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new AuthenticationError('Недействительный refresh token');
    }
  }

  async forgotPassword(data: ForgotPasswordInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      // Не раскрываем, существует ли пользователь
      return { message: 'Если email существует, на него отправлена инструкция' };
    }

    // Генерация токена сброса пароля
    const resetToken = uuidv4();
    passwordResetTokens.set(resetToken, {
      userId: user.id,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 час
    });

    // TODO: Отправить email с токеном сброса пароля
    console.log(`Password reset token for ${user.email}: ${resetToken}`);

    return { message: 'Если email существует, на него отправлена инструкция' };
  }

  async resetPassword(data: ResetPasswordInput) {
    const tokenData = passwordResetTokens.get(data.token);

    if (!tokenData) {
      throw new AuthenticationError('Недействительный токен сброса пароля');
    }

    if (new Date() > tokenData.expiresAt) {
      passwordResetTokens.delete(data.token);
      throw new AuthenticationError('Токен сброса пароля истёк');
    }

    const hashedPassword = await hashPassword(data.password);

    await prisma.user.update({
      where: { id: tokenData.userId },
      data: { password: hashedPassword },
    });

    passwordResetTokens.delete(data.token);

    return { message: 'Пароль успешно изменён' };
  }

  async verifyEmail(token: string) {
    const tokenData = emailVerificationTokens.get(token);

    if (!tokenData) {
      throw new AuthenticationError('Недействительный токен верификации');
    }

    if (new Date() > tokenData.expiresAt) {
      emailVerificationTokens.delete(token);
      throw new AuthenticationError('Токен верификации истёк');
    }

    await prisma.user.update({
      where: { id: tokenData.userId },
      data: { isEmailVerified: true },
    });

    emailVerificationTokens.delete(token);

    return { message: 'Email успешно подтверждён' };
  }
}

export const authService = new AuthService();

