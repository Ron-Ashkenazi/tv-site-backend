const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "User must have first name"],
    minlen: 1,
  },
  lastName: {
    type: String,
    required: [true, "User must have last name"],
    minlen: 1,
  },
  userName: {
    type: String,
    unique: true,
    required: [true, "User must have user-name"],
    minlen: 1,
  },
  password: {
    type: String,
    required: [true, "User must have password"],
    minlen: 5,
    select: false,
  },
  tvShows: {
    type: Array,
    required: [true, "User must have tv shows"],
  },
  movies: {
    type: Array,
    required: [true, "User must have movies"],
  },
  watchlist: {
    type: Array,
    required: [true, "User must have watch-list"],
  },
  passwordChangedAt: Date,
});

userSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
