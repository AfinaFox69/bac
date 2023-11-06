const Router = require('express');
const router = new Router();
const controller = require('./authController');
const { check } = require('express-validator');
const authMiddleware = require('./middleware/authMiddleware');
const roleMiddleware = require('./middleware/roleMiddleware');

router.post(
  '/registrationNew',
  [
    check('username', 'Имя пользователя не может быть пустым').notEmpty(),
    check('password', 'Пароль не должен быть больше 4 и меньше 10 символов').isLength({
      min: 4,
      max: 10,
    }),
  ],
  controller.registrationNew,
);
router.post('/login', controller.login);
router.get('/users', controller.getUser);
router.post('/user', controller.getUserOne)
router.get('/me', authMiddleware, controller.me);
router.put('/rename', controller.rename);
router.post('/upload',controller.upl)
router.put('/repassword',controller.repassword)
router.post('/info',controller.info)
router.post('/addfavorites',controller.addfavorites)
router.post('/getfavorites',controller.getfavorites)
router.delete('/deletefavorites',controller.deletefavorites)
router.get('/chat',controller.chat)
router.post('/emailReading',controller.emailReading)
router.post('/getemail',controller.getEmail)

router.post('/sendmessage',controller.sendmessage)
router.post('/getmessage',controller.getmessage)
router.put('/updatemessage', controller.updatemessage);
router.delete('/deletemessage', controller.deletemessage);


module.exports = router;
