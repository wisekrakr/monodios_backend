module.exports = beautifyUrl = (website) => {
  let validatedWebsite = {};

  if (website.trim().substring(0, 4) !== "http") {
    return (validatedWebsite.website = `http://${website.trim()}`);
  } else {
    return (validatedWebsite.website = website);
  }
};
