import dayjs from "dayjs";
import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import * as z from "zod";
import { HabitModel } from "../models/habit.model";
import { createSchemaValidationMessage } from "../utils/create-schema-validation-message.util";

export class HabitController {
	store = async (req: Request, res: Response): Promise<Response> => {
		const schema = z.object({
			name: z.string(),
		});

		const habitSchemaValidation = schema.safeParse(req.body);

		if (!habitSchemaValidation.success) {
			const errors = createSchemaValidationMessage(
				habitSchemaValidation.error.issues,
			);

			return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
				message: errors,
			});
		}

		const findHabit = await HabitModel.findOne({
			name: habitSchemaValidation.data.name,
		});

		if (findHabit) {
			return res
				.status(StatusCodes.CONFLICT)
				.json({ message: "This habit already exists." });
		}

		const createdHabit = await HabitModel.create({
			name: habitSchemaValidation.data.name,
			completedDates: [],
			userId: req.user.id,
		});

		return res.status(StatusCodes.CREATED).json(createdHabit);
	};

	index = async (req: Request, res: Response) => {
		const allHabits = await HabitModel.find({
			userId: req.user.id,
		});

		return res.status(StatusCodes.OK).json(allHabits);
	};

	remove = async (req: Request, res: Response) => {
		const schema = z.object({
			id: z.string().length(24),
		});

		const habitSchemaValidation = schema.safeParse(req.params);

		if (!habitSchemaValidation.success) {
			const errors = createSchemaValidationMessage(
				habitSchemaValidation.error.issues,
			);

			return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
				message: errors,
			});
		}

		const findHabit = await HabitModel.findOne({
			_id: habitSchemaValidation.data.id,
			userId: req.user.id,
		});

		if (!findHabit) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ messege: "Habit not found." });
		}

		await HabitModel.deleteOne({
			_id: habitSchemaValidation.data.id,
		});

		return res
			.status(StatusCodes.OK)
			.json({ message: "Habit successfully removed." });
	};

	toggle = async (req: Request, res: Response) => {
		const schema = z.object({
			id: z.string().length(24),
		});

		const habitSchemaValidation = schema.safeParse(req.params);

		if (!habitSchemaValidation.success) {
			const errors = createSchemaValidationMessage(
				habitSchemaValidation.error.issues,
			);

			return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
				message: errors,
			});
		}

		const findHabit = await HabitModel.findOne({
			_id: habitSchemaValidation.data.id,
			userId: req.user.id,
		});

		if (!findHabit) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ messege: "Habit not found." });
		}

		const now = dayjs().startOf("day").toISOString();

		const isCompletedHabitOnDate = findHabit
			.toObject()
			?.completedDates.find(
				(item) => dayjs(String(item)).toISOString() === now,
			);

		if (isCompletedHabitOnDate) {
			const updatedHabit = await HabitModel.findOneAndUpdate(
				{
					_id: habitSchemaValidation.data.id,
				},
				{
					$pull: {
						completedDates: now,
					},
				},
				{
					returnDocument: "after",
				},
			);

			return res.status(StatusCodes.OK).json({ updatedHabit });
		}

		const updatedHabit = await HabitModel.findOneAndUpdate(
			{
				_id: habitSchemaValidation.data.id,
			},
			{
				$push: {
					completedDates: now,
				},
			},
			{
				returnDocument: "after",
			},
		);

		return res.status(StatusCodes.OK).json({ updatedHabit });
	};

	metrics = async (req: Request, res: Response) => {
		const schema = z.object({
			id: z.string(),
			date: z.coerce.date(),
		});

		const metricsSchemaValidation = schema.safeParse({
			...req.params,
			...req.query,
		});

		if (!metricsSchemaValidation.success) {
			const errors = createSchemaValidationMessage(
				metricsSchemaValidation.error.issues,
			);

			return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
				message: errors,
			});
		}

		const dateFrom = dayjs(metricsSchemaValidation.data.date).startOf("month");

		const dateTo = dayjs(metricsSchemaValidation.data.date).endOf("month");

		const [habitMetrics] = await HabitModel.aggregate()
			.match({
				_id: new mongoose.Types.ObjectId(metricsSchemaValidation.data.id),
				userId: req.user.id,
			})
			.project({
				_id: 1,
				name: 1,
				completedDates: {
					$filter: {
						input: "$completedDates",
						as: "completedDate",
						cond: {
							$and: [
								{
									$gte: ["$$completedDate", dateFrom.toDate()],
								},
								{
									$lte: ["$$completedDate", dateTo.toDate()],
								},
							],
						},
					},
				},
			});

		if (!habitMetrics) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ message: "Habit not found." });
		}

		return res.status(StatusCodes.OK).json(habitMetrics);
	};
}
