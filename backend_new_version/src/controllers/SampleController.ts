import { Request, Response, NextFunction } from "express";
import { SampleService } from "../services/SampleService";
import { ImageAnnotationService } from "../services/ImageAnnotationService";
import { BaseController } from "./BaseController";
import { Sample } from "../entities/Sample";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

export class SampleController extends BaseController<Sample> {
  private imageAnnotationService: ImageAnnotationService;
  private sampleService: SampleService;

  constructor() {
    const sampleService = new SampleService();
    super(sampleService);
    this.sampleService = sampleService;
    this.imageAnnotationService = new ImageAnnotationService();
  }

  async getAllSamples(req: Request, res: Response, next: NextFunction) {
    try {
      const samples = await this.sampleService.findAll();
      res.json(samples);
    } catch (error) {
      next(error);
    }
  }

  async getSampleById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const sample = await this.sampleService.findComplete(id);
      if (!sample) {
        return res.status(404).json({ message: "Sample not found" });
      }
      res.json(sample);
    } catch (error) {
      next(error);
    }
  }

  async createAnnotation(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const sampleId = parseInt(req.params.id);
      const userId = req.user!.userId;
      const annotationData = {
        ...req.body,
        sample_id: sampleId,
        user_id: userId,
      };

      const annotation =
        await this.imageAnnotationService.create(annotationData);
      res.status(201).json(annotation);
    } catch (error) {
      next(error);
    }
  }

  async getAnnotations(req: Request, res: Response, next: NextFunction) {
    try {
      const sampleId = parseInt(req.params.id);
      const annotations =
        await this.imageAnnotationService.findBySample(sampleId);
      res.json(annotations);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const sample = await this.sampleService.create(req.body);
      res.status(201).json(sample);
    } catch (error) {
      next(error);
    }
  }

  async deleteAnnotation(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const sampleId = parseInt(req.params.id);
      const annotationId = parseInt(req.params.annotationId);
      const userId = req.user!.userId;
      const annotation =
        await this.imageAnnotationService.findById(annotationId);
      if (!annotation) {
        return res.status(404).json({ message: "Annotation not found" });
      }
      if (annotation.user_id !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      await this.imageAnnotationService.deleteById(annotationId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const updatedSample = await this.sampleService.update(id, req.body);
      if (!updatedSample) {
        return res.status(404).json({ message: "Sample not found" });
      }
      res.json(updatedSample);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const deleted = await this.sampleService.delete(id);
      if (!deleted) {
        return res.status(404).json({ message: "Sample not found" });
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
