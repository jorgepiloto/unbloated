const config = {
  plugins: [
    require("postcss-nested"),
    require("autoprefixer"),
    require("cssnano")({ preset: "default" }),
  ],
};

module.exports = config;
