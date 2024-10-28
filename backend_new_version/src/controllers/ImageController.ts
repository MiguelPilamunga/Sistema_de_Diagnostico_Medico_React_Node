// ImageController.ts
import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

class ImageController {
    private dziBasePath: string = '/home/labctrl/Documentos/pastor/ProyectoDilanFork/backend_new_version/src/dzi_files';
    serveDZITiles(req: Request, res: Response) {
        try {
            const filename = req.params.filename;
            const relativePath = req.path.replace('/dzi/', ''); 
            const filePath = path.join(this.dziBasePath, relativePath);
            if (!fs.existsSync(filePath)) {
                console.error('DZI tile not found:', filePath);
                return res.status(404).json({ message: 'DZI tile not found' });
            }

            res.sendFile(filePath);
        } catch (error) {
            console.error('Error in serveDZITiles:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}

export default ImageController;