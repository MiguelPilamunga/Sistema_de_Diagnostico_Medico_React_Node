import { ImageAnnotation } from "../entities/ImageAnnotation";
import { ImageAnnotationRepository } from "../repositories/ImageAnnotationRepository";
import { BaseService } from "./BaseService";

export class ImageAnnotationService extends BaseService<ImageAnnotation> {
  private annotationRepository: ImageAnnotationRepository;

  constructor() {
    const repository = new ImageAnnotationRepository();
    super(repository);
    this.annotationRepository = repository;
  }

  async findBySample(sampleId: number): Promise<ImageAnnotation[]> {
    return await this.annotationRepository.findBySample(sampleId);
  }

  async findByUser(userId: number): Promise<ImageAnnotation[]> {
    return await this.annotationRepository.findByUser(userId);
  }

  async deleteById(id: number): Promise<void> {
    return await this.annotationRepository.deleteById(id);
  }
}
