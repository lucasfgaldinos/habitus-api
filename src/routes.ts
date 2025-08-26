import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import packageJson from "../package.json";
import { AuthController } from "./controllers/auth.controller";
import { FocusTimeController } from "./controllers/focus-time.controller";
import { HabitController } from "./controllers/habit.controller";
import { authMiddleware } from "./middlewares/auth.middleware";

export const routes = Router();

const habitController = new HabitController();
const focusTimeController = new FocusTimeController();
const authController = new AuthController();

routes.get("/", (_req, res) => {
	const { name, description, version } = packageJson;

	return res.status(StatusCodes.OK).json({
		name,
		description,
		version,
	});
});

routes.get("/auth", authController.auth);
routes.get("/auth/callback", authController.authCallback);

routes.use(authMiddleware);

routes.get("/habit", authMiddleware, habitController.index);
routes.get("/habit/:id/metrics", habitController.metrics);
routes.post("/habit", habitController.store);
routes.delete("/habit/:id", habitController.remove);
routes.patch("/habit/:id/toggle", habitController.toggle);

routes.post("/focus-time", focusTimeController.store);
routes.get("/focus-time/metrics", focusTimeController.metricsByMonth);
routes.get("/focus-time", focusTimeController.index);
