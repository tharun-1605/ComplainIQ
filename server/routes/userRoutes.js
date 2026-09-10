import express from 'express';
import { getProfile, updateProfile } from '../controllers/userController.js';
import { getAllUserPosts, getCompletedComplaints, updateStatus } from '../controllers/postController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.get('/user/posts', getAllUserPosts);
router.get('/user/completed-complaints', auth, getCompletedComplaints);
router.put('/user/complaints/:complaintId/status', auth, updateStatus);

export default router;
