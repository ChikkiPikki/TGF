const express = require('express');
const router = express.Router({mergeParams: true});
const connectEnsureLogin = require('connect-ensure-login');
const passport = require('passport');



