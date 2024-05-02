const express = require("express");
const Photo = require("../db/photoModel");
const router = express.Router();

router.post("/", async (request, response) => {
  const photo = new Photo(request.body);
  try {
    await photo.save();
    response.send(photo);
  } catch (error) {
    console.log(error);
    response.status(500).send(error);
  }
});

router.get("/", async (request, response) => {
  try {
    const photos = await Photo.find({});
    response.send(photos);
  } catch (error) {
    response.status(500).send({ error });
  }
});

module.exports = router;
