import { Router } from "express";
import { SampleController } from "../controllers/SampleController";
import {
  authenticate,
  authorize,
  AuthenticatedRequest,
} from "../middleware/authMiddleware";
import { Response, NextFunction } from "express";
import formDetailRoutes from "./formDetailRoutes";

const router = Router();
const sampleController = new SampleController();

router.use("/:sampleId/form-details", formDetailRoutes);

router.get(
  "/",
  (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
    sampleController.getAllSamples(req, res, next),
);

router.post(
  "/",
  authenticate,
  authorize(["CREATE_SAMPLE"]),
  (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
    sampleController.create(req, res, next),
);

// router.get('/:id',
//     authenticate,
//     authorize(['VIEW_SAMPLES']),
//     (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
//         sampleController.getSampleById(req, res, next)
// );

router.get(
  "/:id",
  (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
    sampleController.getSampleById(req, res, next),
);

router.put(
  "/:id",
  authenticate,
  authorize(["EDIT_SAMPLE"]),
  (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
    sampleController.update(req, res, next),
);

router.delete(
  "/:id",
  authenticate,
  authorize(["DELETE_SAMPLE"]),
  (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
    sampleController.delete(req, res, next),
);

// Rutas para anotaciones
router.post(
  "/:id/annotations",
  authenticate,
  authorize(["CREATE_ANNOTATION"]),
  (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
    sampleController.createAnnotation(req, res, next),
);

router.get(
  "/:id/annotations",
  authenticate,
  authorize(["VIEW_SAMPLES"]),
  (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
    sampleController.getAnnotations(req, res, next),
);

router.delete(
  "/:id/annotations/:annotationId",
  authenticate,
  authorize(["DELETE_ANNOTATION"]),
  (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
    sampleController.deleteAnnotation(req, res, next),
);

export default router;
