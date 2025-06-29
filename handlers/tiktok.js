const axios = require("axios");

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function downloadFromTikwm(url) {
  try {
    const apiEndpoint = process.env.apitiktok + encodeURIComponent(url);
    const res = await axios.get(apiEndpoint);
    const data = res.data?.result;

    console.log("📦 DATA:", data);

    if (!data) {
      throw new Error("❌ Data kosong.");
    }

    // Deteksi slide
    const isSlide = Array.isArray(data.images) && data.images.length > 0;
    // Deteksi story: video dan author.id diawali dengan '7'
    const isStory = data.hdplay && data.author?.id?.startsWith("7");
    const type = isSlide ? "slide" : "video";

    // === SLIDE MODE ===
    if (isSlide) {
      const images = data.images
        .filter(url => typeof url === "string" && url.startsWith("http"))
        .slice(0, 10)
        .map(url => ({
          type: "photo",
          media: url,
        }));

      if (images.length === 0) {
        throw new Error("❌ Gambar slide tidak valid.");
      }

      const caption = `Diunduh melalui: @iniuntukdonlotvidiotiktokbot`;

      await delay(2000);

      return {
        type: "slide",
        images,
        caption,
        audioUrl: data.music || null,
      };
    }

    // === VIDEO / STORY ===
    const videoUrl = data.hdplay;
    const audioUrl = data.music;

    if (!videoUrl) {
      throw new Error("❌ Video tidak ditemukan.");
    }

    await delay(2000);

    return {
      type: isStory ? "story" : "video",
      video: videoUrl,
      audioUrl: audioUrl || null,
    };

  } catch (err) {
    console.error("🧨 ERROR TikTok:", err.message);
    throw new Error(`❌ Gagal memproses link TikTok.`);
  }
}

module.exports = { downloadFromTikwm };
