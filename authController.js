const User = require('./models/User');
const Role = require('./models/Role');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { secret } = require('./config');

const generateAccesToken = (id, roles) => {
  const payload = {
    id,
    roles,
  };
  return jwt.sign(payload, secret, { expiresIn: '24h' });
};

class authController {
  async registrationNew(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Ошибка при регистрации', errors });
      }

      const { username, password } = req.body;
      const candidate = await User.findOne({ username });
      if (candidate) {
        return res.status(400).json({ message: 'Пользователь уже существует' });
      }
      const hashPassword = bcrypt.hashSync(password, 7);
      const userRole = await Role.findOne({ value: 'USER' });

      const user = new User({
        username,
        password: hashPassword,
        roles: [userRole.value],
        avatar: '/uploads/test.png',
        info:"test"
      });

      await user.save();
      return res.json({ message: 'Пользователь успешно зарегестрирован' });
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: 'Registration error' });
    }
  }
  async login(req, res) {
    try {
      //Пришедшие с запроса
      const { username, password } = req.body;
      //В базе данных ищем
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(400).json({ message: `Пользователь ${username} не найден` });
      }
      const validatePassword = bcrypt.compareSync(password, user.password);
      if (!validatePassword) {
        return res.status(400).json({ message: 'Неверный пароль' });
      }
      const token = generateAccesToken(user._id, user.roles);
      return res.json({ token, user });
    } catch (error) {
      console.log(e);
      res.status(400).json({ message: 'Login error' });
    }
  }
  async getUser(req, res) {
    
    try {
      const users = await User.find();

      res.json(users);
    } catch (error) {}
  }
  async getUserOne(req, res) {
    const { username } = req.body;
    try {
      const user = await  User.findOne({ username });

      res.json(user);
    } catch (error) {}
  }
  async me(req, res) {
    try {
      console.log(req.user.id);
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'Не найден чел' });
      }

      res.json(user);
    } catch (error) {}
  }
  async info(req, res) {
    try {
      const { info, username} = req.body;
      
      const user = await User.findOne({ username: username });
      if (!user) {
        return res
          .status(400)
          .json({ message: `Пользователь со  именем ${username} не найден! ` });
      }
      
      user.info = info;
      await user.save();
      return res.json({ message: 'Инфо пользователя успешно изменено' });
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: 'Error renaming user' });
    }
  }
  async rename(req, res) {
    try {
      const { newUsername, oldUsername } = req.body;
      console.log(oldUsername, newUsername);
      const user = await User.findOne({ username: newUsername });
      if (user) {
        return res
          .status(400)
          .json({ message: `Пользователь с именем ${newUsername} уже имеется! ` });
      }
      const currentUser = await User.findOne({ username: oldUsername });
      if (!currentUser) {
        return res
          .status(400)
          .json({ message: `Пользователь со старым именем ${oldUsername} не найден! ` });
      }
      currentUser.username = newUsername;
      await currentUser.save();
      return res.json({ message: 'Имя пользователя успешно изменено' });
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: 'Error renaming user' });
    }
  }
  async upl(req, res) {
    console.log('--------------------------------');
    console.log(req);
    console.log('--------------------------------');
    // try {
    //   console.log(req)
    //   console.log(req.file)
    //   const oldUsername = req.body.oldUsername
    //   const  {filename}  = req.file;
    //   const currentUser = await User.findOne({username: oldUsername})
    //   if (!currentUser) {
    //     return res.status(404).json({ message: 'Пользователь не найден' });
    //   }
    //   currentUser.avatar = `/uploads/${filename}`;
    //   await currentUser.save();
    //   return res.json({ message: 'Аватар успешно обновлен' });
    // } catch (error) {
    //   console.log(error);
    //   res.status(400).json({ message: 'Ошибка при обновлении аватара' });
    // }
  }
  async repassword(req, res) {
    try {
      const { oldUsername, newPassord,oldPassword } = req.body;
      console.log(oldUsername, newPassord);

      const currentUser = await User.findOne({ username: oldUsername });
      if (!currentUser) {
        return res
          .status(400)
          .json({ message: `Пользователь со старым именем ${oldUsername} не найден! ` });
      }
     const match = bcrypt.compareSync(oldPassword, currentUser.password)
     if(!match){
      return res
          .status(400)
          .json({ message: `Не тот пароль! ` }); 
     }

      const hashPassword = bcrypt.hashSync(newPassord, 7);
      currentUser.password = hashPassword;
      await currentUser.save();
      return res.json({
        message: `Паспорт пользователя успешно изменено, ${hashPassword},${newPassord}`,
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: 'Error renaming user' });
    }
  }
}
module.exports = new authController();
