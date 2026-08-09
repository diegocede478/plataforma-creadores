import type { Request, Response } from 'express';
import * as walletService from '../services/wallet.service';

export const getWallet = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const wallet = await walletService.getWallet(userId);

    res.json(wallet);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener wallet';
    res.status(400).json({ error: message });
  }
};

export const deposit = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const { amount } = req.body;

    const result = await walletService.deposit(userId, amount);

    res.status(201).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al depositar';
    res.status(400).json({ error: message });
  }
};

export const withdraw = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const { amount } = req.body;

    const result = await walletService.withdraw(userId, amount);

    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al retirar';
    res.status(400).json({ error: message });
  }
};

export const getTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const result = await walletService.getTransactions(userId, page, limit);

    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener transacciones';
    res.status(400).json({ error: message });
  }
};
