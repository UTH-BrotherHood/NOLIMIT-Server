// // src/controllers/apiKey.controller.ts

// import { Request, Response } from 'express';
// import apiKeyService from '../services/apiKey.service';

// class ApiKeyController {
//     async createApiKey(req: Request, res: Response) {
//         try {
//             const { name, clientId, permissions, expiresAt } = req.body;
//             const apiKey = await apiKeyService.generateApiKey({
//                 name,
//                 clientId,
//                 permissions,
//                 expiresAt: expiresAt ? new Date(expiresAt) : undefined
//             });

//             res.status(201).json(apiKey);
//         } catch (error) {
//             res.status(500).json({ error: 'Failed to create API key' });
//         }
//     }

//     async getClientApiKeys(req: Request, res: Response) {
//         try {
//             const { clientId } = req.params;
//             const apiKeys = await apiKeyService.getApiKeys(clientId);
//             res.json(apiKeys);
//         } catch (error) {
//             res.status(500).json({ error: 'Failed to fetch API keys' });
//         }
//     }

//     async deactivateApiKey(req: Request, res: Response) {
//         try {
//             const { key } = req.params;
//             const success = await apiKeyService.deactivateApiKey(key);

//             if (success) {
//                 res.json({ message: 'API key deactivated successfully' });
//             } else {
//                 res.status(404).json({ error: 'API key not found' });
//             }
//         } catch (error) {
//             res.status(500).json({ error: 'Failed to deactivate API key' });
//         }
//     }
// }

// export default new ApiKeyController();