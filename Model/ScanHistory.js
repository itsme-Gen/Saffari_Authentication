const mongoose = require('mongoose');

const scanHistorySchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',  
    required: true 
  },
  animal_name: { 
    type: String, 
    required: true 
  },
  scientific_name: { 
    type: String, 
    required: true 
  },
  confidence: { 
    type: Number, 
    required: true 
  },
  taxonomy: String,
  details: String,
  is_endangered: Boolean,
  scan_date: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('ScanHistory', scanHistorySchema, 'scan_history');