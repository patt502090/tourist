const functions = require('@google-cloud/functions-framework');
const nodemailer = require('nodemailer');

functions.cloudEvent('send-reminder', async (cloudEvent) => {
  try {
    const pubSubMessage = cloudEvent.data.message;
    const data = JSON.parse(Buffer.from(pubSubMessage.data, 'base64').toString());

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'touristcode.notifications@gmail.com',
        pass: 'kclu nhow ydze oaal',
      },
    });

    const mailPromises = data.participants.map((participant) => 
      transporter.sendMail({
        from: '"Tourist Code Thailand" <touristcode.notifications@gmail.com>',
        to: participant.email,
        subject: `แจ้งเตือน: การแข่งขัน "${data.title}" เริ่มใน 30 นาที | Reminder: "${data.title}" Starts in 30 Minutes`,
        text: `เรียน ${participant.username},\n\n` +
          `เราขอแจ้งให้ท่านทราบว่า การแข่งขัน "${data.title}" จะเริ่มในอีก 30 นาทีข้างหน้า ในวันที่ ${data.startTimeThai} (เวลาไทย) กรุณาเตรียมตัวให้พร้อมสำหรับการแข่งขัน\n\n` +
          `Dear ${participant.username},\n\n` +
          `We would like to inform you that the "${data.title}" competition will commence in 30 minutes on ${data.startTimeThai} (Thailand time). Please prepare yourself for the event.\n\n` +
          `ขอแสดงความนับถือ,\nทีมงาน Tourist Code Thailand\n` +
          `Best regards,\nThe Tourist Code Thailand Team`,
      })
    );

    await Promise.all(mailPromises);
    console.log(`ส่งการแจ้งเตือนสำหรับ "${data.title}" เรียบร้อย จำนวนผู้รับ: ${data.participants.length}`);
  } catch (error) {
    console.error(`เกิดข้อผิดพลาด: ${error.message}`);
    throw error;
  }
});