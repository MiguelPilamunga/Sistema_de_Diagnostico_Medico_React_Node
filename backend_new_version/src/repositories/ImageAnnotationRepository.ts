import { ImageAnnotation } from "../entities/ImageAnnotation";
import { BaseRepository } from "./BaseRepository";

export class ImageAnnotationRepository extends BaseRepository<ImageAnnotation> {
  constructor() {
    super(ImageAnnotation);
  }

  async findBySample(sampleId: number): Promise<ImageAnnotation[]> {
    return await this.repository.find({
      where: { sample_id: sampleId },
      relations: ["user"],
      order: { created_at: "DESC" },
    });
  }

  async findByUser(userId: number): Promise<ImageAnnotation[]> {
    return await this.repository.find({
      where: { user_id: userId },
      relations: ["sample"],
      order: { created_at: "DESC" },
    });
  }

  async deleteById(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
