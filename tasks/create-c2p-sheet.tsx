#!/usr/bin/env node

const configData = require('../project-config.json')
const { googleAuth } = require('sfc-utils/copy/c2p_sheet')

googleAuth(configData)
