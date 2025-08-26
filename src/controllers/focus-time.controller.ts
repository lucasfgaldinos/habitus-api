import dayjs from "dayjs";
import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as z from "zod";
import { FocusTimeModel } from "../models/focus-time.model";
import { createSchemaValidationMessage } from "../utils/create-schema-validation-message.util";

export class FocusTimeController {
	store = async (req: Request, res: Response) => {
		const schema = z.object({
			timeTo: z.coerce.date(),
			timeFrom: z.coerce.date(),
		});

		const focusTimesSchemaValidation = schema.safeParse(req.body);

		if (!focusTimesSchemaValidation.success) {
			const errors = createSchemaValidationMessage(
				focusTimesSchemaValidation.error.issues,
			);

			return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
				message: errors,
			});
		}

		const timeFrom = dayjs(focusTimesSchemaValidation?.data?.timeFrom);
		const timeTo = dayjs(focusTimesSchemaValidation?.data?.timeTo);

		const isTimeToBeforeTimeFrom = timeTo.isBefore(timeFrom);

		if (isTimeToBeforeTimeFrom) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ message: "TimeTo cannot be before timeFrom." });
		}

		const focusTime = await FocusTimeModel.create({
			timeFrom: timeFrom.toDate(),
			timeTo: timeTo.toDate(),
			userId: req.user.id,
		});
		return res.status(StatusCodes.CREATED).json(focusTime);
	};

	metricsByMonth = async (req: Request, res: Response) => {
		const schema = z.object({
			date: z.coerce.date(),
		});

		const dateSchemaValidation = schema.safeParse(req.query);

		if (!dateSchemaValidation.success) {
			const errors = createSchemaValidationMessage(
				dateSchemaValidation.error.issues,
			);

			return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
				message: errors,
			});
		}

		const monthStart = dayjs(dateSchemaValidation.data.date).startOf("month");
		const monthEnd = dayjs(dateSchemaValidation.data.date).endOf("month");

		const focusTimesMetrics = await FocusTimeModel.aggregate()
			.match({
				timeFrom: {
					$gte: monthStart.toDate(),
					$lt: monthEnd.toDate(),
				},
				userId: req.user.id,
			})
			.project({
				year: {
					$year: "$timeFrom",
				},
				month: {
					$month: "$timeFrom",
				},
				day: {
					$dayOfMonth: "$timeFrom",
				},
			})
			.group({
				_id: ["$year", "$month", "$day"],
				count: {
					$sum: 1,
				},
			})
			.sort({
				_id: 1,
			});

		return res.status(StatusCodes.OK).json(focusTimesMetrics);
	};

	index = async (req: Request, res: Response) => {
		const schema = z.object({
			date: z.coerce.date(),
		});

		const dateSchemaValidation = schema.safeParse(req.query);

		if (!dateSchemaValidation.success) {
			const errors = createSchemaValidationMessage(
				dateSchemaValidation.error.issues,
			);

			return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
				message: errors,
			});
		}

		const dayStart = dayjs(dateSchemaValidation.data.date).startOf("day");
		const dayEnd = dayjs(dateSchemaValidation.data.date).endOf("day");

		const focusTimes = await FocusTimeModel.find({
			timeFrom: {
				$gte: dayStart.toDate(),
				$lte: dayEnd.toDate(),
			},
			userId: req.user.id,
		}).sort({
			timeFrom: 1,
		});

		return res.status(StatusCodes.OK).json(focusTimes);
	};
}
