import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import errorHandler from './middleware/errorHandler.js';
import corsOptions from './config/cors.js';
import limiterOptions from './config/rateLimit.js';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import productRoutes from './routes/product.routes.js';
import categoryRoutes from './routes/category.routes.js';
import cartRoutes from './routes/cart.routes.js';
import orderRoutes from './routes/order.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import reviewRoutes from './routes/review.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import newsletterRoutes from './routes/newsletter.routes.js';
import adminRoutes from './routes/admin.routes.js';
import googleRoutes from './routes/google.routes.js';
import deliveryRoutes from './routes/delivery.routes.js';
import variantRoutes from './routes/variant.routes.js';
import { handleWebhook } from './controllers/payment.controller.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.set('trust proxy', 1);

const WEBHOOK_PATH = '/api/payments/webhook';

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors(corsOptions));

app.post(WEBHOOK_PATH, express.raw({ type: 'application/json' }), handleWebhook);

const limiter = rateLimit(limiterOptions);
app.use((req, res, next) => {
  if (req.path === WEBHOOK_PATH) return next();
  limiter(req, res, next);
});

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'API opérationnelle' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/delivery-methods', deliveryRoutes);
app.use('/api/variants', variantRoutes);
app.use('/api', googleRoutes);

app.use(errorHandler);

export default app;