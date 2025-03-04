const express = require('express');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());

app.post('/send-reminder', async (req, res) => {
  try {
    const pubSubMessage = req.body.message;
    const data = JSON.parse(Buffer.from(pubSubMessage.data, 'base64').toString());

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'touristcode.notifications@gmail.com', 
        pass: 'SDA240-229', 
      },
    });

    const mailPromises = data.participants.map((participant) =>
      transporter.sendMail({
        from: '"Tourist Code Thailand" <your-email@gmail.com>',
        to: participant.email,
        subject: `แจ้งเตือน: ${data.title} เริ่มใน 30 นาที`,
        text: `สวัสดี ${participant.username},\n"${data.title}" จะเริ่มใน 30 นาที เวลา ${data.startTimeThai} (เวลาไทย)\nเตรียมตัวให้พร้อม!`,
      })
    );

    await Promise.all(mailPromises);
    console.log(`ส่งการแจ้งเตือนสำหรับ "${data.title}" เรียบร้อย จำนวนผู้รับ: ${data.participants.length}`);
    res.status(200).send('OK');
  } catch (error) {
    console.error(`เกิดข้อผิดพลาด: ${error.message}`);
    res.status(500).send('Error');
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});