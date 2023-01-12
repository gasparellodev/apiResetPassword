const express = require("express");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const mailer = require("../../modules/mailer");

const authConfig = require("../../config/auth.json");

const router = express.Router();

function generateToken(params = {}) {
  return jwt.sign(params, authConfig.secret, {
    expiresIn: 86400,
  });
}

router.post("/register", async (req, res) => {
  const { email } = req.body;

  try {
    if (await User.findOne({ email }))
      return res
        .status(400)
        .send({ error: "Usuário já cadastrado na base!! :)" });

    const user = await User.create(req.body);

    user.password = undefined;

    return res.send({ user, token: generateToken({ id: user.id }) });
  } catch (err) {
    return res.status(400).send({ error: "Registration Failed" });
  }
});

router.post("/authenticate", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user)
    return res.status(400).send({ error: "Usuário não encontrado! :(" });

  if (!(await bcrypt.compare(password, user.password)))
    return res.status(400).send({ error: "Senha incorreta!! :(" });

  user.password = undefined;

  res.send({
    user,
    token: generateToken({ id: user.id }),
  });
});

router.post("/forgot_password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({
      email,
    });

    if (!user)
      return res.status(400).send({ error: "Usuário não encontrado :(" });

    const token = crypto.randomBytes(20).toString("hex");

    const now = new Date();
    now.setHours(now.getHours() + 1);

    await User.findByIdAndUpdate(user.id, {
      $set: {
        passwordResetToken: token,
        passwordResetExpires: now,
      },
    });

    await mailer.sendMail(
      {
        to: email,
        from: "vinygasparello@gmail.com",
        subject: "Test",
        template: "forgot_password",
        context: { token },
      },
      (err) => {
        console.log(err)
        if (err)
          return res
            .status(400)
            .send({
              error:
                "Infelizmente não vou possível enviar o email para recuperação de senha! :(",
            });
        return res.send;
      }
    );
  } catch (err) {
    
    res.status(400).send({ error: "Erro ao recuperar senha :(" });
  }
});

router.post("/reset_password", async (req, res) => {
  const { email, token, password } = req.body;

  try {
    const user = await User.findOne({ email })
      .select('+passwordResetToken passwordResetExpires');

    if (!user)
      return res.status(400).send({ error: "Usuário não encontrado :(" });

    if(token !== user.passwordResetToken)
      return res.status(400).send({ error: "Token inválido :(" });

    const now = new Date();

    if (now > user.passwordResetExpires)
      return res.status(400).send({ error: 'Token expirado, por favor gere um novo! :(' })

      user.password = password;

      await user.save();

      res.send();
    
  } catch (err) {
    res.status(400).send({ error: "Erro ao recuperar senha :(" });
  }
});

module.exports = (app) => app.use("/auth", router);
