import express from 'express';
import { replyToPost } from '../controllers/adminController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/admin/posts/:postId/reply', auth, replyToPost);

export default router;
