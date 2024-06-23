const AppError = require("../utils/appError");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users: users,
    },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError("No user found with that id", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      user: user,
    },
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      user: newUser,
    },
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select("+password");

  if (!user) {
    return next(new AppError("No user found with that id", 404));
  }

  const { currentPassword } = req.body;

  if (currentPassword) {
    if (!(await user.correctPassword(currentPassword, user.password))) {
      return next(new AppError("Incorrect email or password", 401));
    }
  }

  const { dataToUpdate } = req.body;

  Object.keys(dataToUpdate).forEach((key) => {
    user[key] = dataToUpdate[key];
  });

  await user.save();

  res.status(201).json({
    status: "success",
    data: {
      user: user,
    },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError("No user found with that id", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.addItemToList = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError("No user found with that id", 404));
  }

  const { list, item } = req.body;

  let listToUpdate;

  // Determine which list to update
  if (list === "watchlist") {
    listToUpdate = user.watchlist;
  } else if (list === "tvShows") {
    listToUpdate = user.tvShows;
  } else {
    listToUpdate = user.movies;
  }

  // Check if the item already exists in the list
  const itemExists = listToUpdate.some(
    (existingItem) => JSON.stringify(existingItem) === JSON.stringify(item)
  );

  if (itemExists) {
    return res.status(400).json({
      status: "fail",
      message: "Item already exists in the list",
    });
  }

  // If the item doesn't exist, add it to the list
  listToUpdate.push(item);

  await user.save();

  res.status(201).json({
    status: "success",
    data: {
      user: user,
    },
  });
});

exports.removeItemFromList = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError("No user found with that id", 404));
  }

  const { list, id } = req.body;

  if (list === "watchlist") {
    user.watchlist = user.watchlist.filter((item) => item.id !== id);
  } else if (list === "tvShows") {
    user.tvShows = user.tvShows.filter((item) => item.id !== id);
  } else {
    user.movies = user.movies.filter((item) => item.id !== id);
  }

  await user.save();

  res.status(201).json({
    status: "success",
    data: {
      user: user,
    },
  });
});

exports.updateItemRating = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError("No user found with that id", 404));
  }

  const { list, id, rating } = req.body;

  let updatedList;
  if (list === "tvShows") {
    updatedList = user.tvShows;
  } else {
    updatedList = user.movies;
  }

  const itemToUpdateIndex = updatedList.findIndex((item) => item.id === id);

  if (itemToUpdateIndex !== -1) {
    updatedList[itemToUpdateIndex].my_rating = rating;
  } else {
    return next(new AppError("Item with that id not found in the list", 404));
  }

  if (list === "tvShows") {
    user.tvShows = updatedList;
    user.markModified("tvShows");
    user.save();
  } else {
    user.movies = updatedList;
    user.markModified("movies");
    user.save();
  }

  res.status(201).json({
    status: "success",
    data: {
      user: user,
    },
  });
});

exports.ping = catchAsync(async (req, res, next) => {
  return res.status(200).json({ message: "Server is live" });
});
