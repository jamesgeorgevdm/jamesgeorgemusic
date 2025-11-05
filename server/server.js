import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint for contact form
app.post("/contact", async (req, res) => {
  const { email, subject, message } = req.body;

  try {
    // Create transporter (use your real email credentials or app password)
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // use SSL
        auth: {
            user: "jamesv234@gmail.com",
            pass: "roqexibkvppsdopq", // your app password
        },
        tls: {
            rejectUnauthorized: false, // helps with certain local setups
        },
});

    // Send main message to you
    await transporter.sendMail({
      from: email,
      to: "jamesv234@gmail.com",
      subject: `New message from ${email}: ${subject}`,
      text: message,
    });

    // Auto-reply to the sender
   await transporter.sendMail({
    from: {
    name: "James George Music",
    address: "jamesv234@gmail.com"
    },
    to: email,
    subject: "Thanks for reaching out!",
    text: `Hi there! \n\nThanks for getting in touch. I’ve received your message and will get back to you soon.`,
});


    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ success: false, error: "Email failed to send." });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
