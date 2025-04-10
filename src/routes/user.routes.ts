import express from "express"
import { getProfile, updateProfile, changePassword, getAllUsers, getUserById } from "../controllers/user.controller"
import { authenticate, authorize } from "../middlewares/auth.middleware"
import { body } from "express-validator"
import { validate } from "../middlewares/validation.middleware"

const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: إدارة المستخدمين
 */

/**
 * @openapi
 * /api/users/profile:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user profile
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 */
router.get("/profile", authenticate, getProfile)

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: تحديث الملف الشخصي
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserProfileUpdate'
 *     responses:
 *       200:
 *         description: تم التحديث بنجاح
 *       400:
 *         description: بيانات غير صالحة
 *       401:
 *         description: غير مصرح
 *       500:
 *         description: خطأ في السيرفر
 */
router.put(
  "/profile",
  authenticate,
  [
    body("name").optional().isLength({ min: 3 }).withMessage("Name must be at least 3 characters"),
    body("phone")
      .optional()
      .matches(/^\d{10,12}$/)
      .withMessage("Phone number must be between 10 and 12 digits"),
  ],
  validate,
  updateProfile,
)

/**
 * @swagger
 * components:
 *   schemas:
 *     ChangePassword:
 *       type: object
 *       required:
 *         - currentPassword
 *         - newPassword
 *       properties:
 *         currentPassword:
 *           type: string
 *           description: كلمة المرور الحالية
 *           example: OldPass123
 *         newPassword:
 *           type: string
 *           description: كلمة المرور الجديدة (يجب ألا تقل عن 6 أحرف)
 *           example: NewStrongPass456

 * /api/users/change-password:
 *   put:
 *     summary: تغيير كلمة المرور
 *     description: يسمح للمستخدم المسجل بتغيير كلمة المرور الخاصة به بعد إدخال كلمة المرور الحالية
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePassword'
 *     responses:
 *       200:
 *         description: ✅ تم تغيير كلمة المرور بنجاح
 *       400:
 *         description: ❌ بيانات الإدخال غير صالحة (مثلاً كلمة مرور قصيرة)
 *       401:
 *         description: ❌ غير مصرح - لم يتم إرسال توكن أو توكن غير صالح
 *       403:
 *         description: ❌ كلمة المرور الحالية غير صحيحة
 *       500:
 *         description: ⚠️ خطأ داخلي في الخادم
 */

router.put(
  "/change-password",
  authenticate,
  [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword")
      .notEmpty()
      .withMessage("New password is required")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters"),
  ],
  validate,
  changePassword,
)


// Admin routes
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: الحصول على قائمة جميع المستخدمين (للمسؤولين فقط)
 *     description: |
 *       تتطلب صلاحية مسؤول (admin)  
 *       يدعم التصفية والترتيب باستخدام query parameters
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: رقم الصفحة
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: عدد العناصر في الصفحة
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, admin]
 *         description: تصفية حسب الدور
 *     responses:
 *       200:
 *         description: قائمة المستخدمين مع بيانات الصفحة
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/",
  authenticate,
  authorize(["admin"]),
  getAllUsers)

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: الحصول على مستخدم محدد بواسطة ID (للمسؤولين فقط)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: ObjectId
 *         example: 60d21b4667d0d8992e610c85
 *         description: معرّف المستخدم المطلوب
 *     responses:
 *       200:
 *         description: بيانات المستخدم المطلوب
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: |
 *           خطأ في المعرّف:
 *           - Invalid user ID format
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: المستخدم غير موجود
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/:id", authenticate, authorize(["admin"]), getUserById)

export default router
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: ObjectId
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *         role:
 *           type: string
 *           enum: [user, admin]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time

 *     Pagination:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *         page:
 *           type: integer
 *         limit:
 *           type: integer
 *         totalPages:
 *           type: integer
 *         hasNextPage:
 *           type: boolean
 *         hasPrevPage:
 *           type: boolean
 */
/**
 * @swagger
 * components:
 *   responses:
 *     Unauthorized:
 *       description: غير مصرح - يجب تسجيل الدخول أو إرسال توكن صالح
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: Unauthorized

 *     Forbidden:
 *       description: صلاحيات غير كافية
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: Forbidden

 *     ServerError:
 *       description: خطأ داخلي في السيرفر
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: Internal Server Error
 */
