import express from 'express';
import {
  createPost,
  getMyPosts,
  likePost,
  addComment,
  deletePost
} from '../controllers/postController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/posts', auth, createPost);
router.get('/posts', auth, getMyPosts);
router.post('/posts/:postId/like', auth, likePost);
router.post('/posts/:postId/comment', auth, addComment);
router.delete('/posts/:postId', auth, deletePost);

export default router;
