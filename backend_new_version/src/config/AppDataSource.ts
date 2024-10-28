import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Role } from "../entities/Role";
import { Permission } from "../entities/Permission";
import { Sample } from "../entities/Sample";
import { TissueType } from "../entities/TissueType";
import { FormDetail } from "../entities/FormDetail";
import { ImageAnnotation } from "../entities/ImageAnnotation";
import dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || "3306"),
    username: process.env.DB_USER || 'db_medical',
    password: process.env.DB_PASSWORD || 'medical_123',
    database: process.env.DB_NAME || 'MedicalHistDB',
    synchronize: false,
    logging: true,
    entities: [
        User,
        Role,
        Permission,
        Sample,
        TissueType,
        FormDetail,
        ImageAnnotation
    ],
    migrations: ["src/migrations/*.ts"],
    subscribers: ["src/subscribers/*.ts"],
    connectTimeout: 60000,
    acquireTimeout: 60000,
    extra: {
        connectionLimit: 10
    }
});

export default AppDataSource;
