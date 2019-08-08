
const d3 = require('./d3.v3.min');

module.exports = {
  H_REDUCE: 80,
  W_REDUCE: 400,
  SEARCH_RESULT_ID_PFX: 'li@',
  MINIMUM_SEARCH_TERM_LENGTH: 2,
  duration: 400,
  NO_FILL_COLOR: '#fff',
  LINE_WIDTH: '2px',
  BOLD_LINE_WIDTH: '4px',
  LABEL_OFFSET: 10,
  color: {
    Critical: d3.rgb('rgb(252, 13, 27)'),
    Warning: d3.rgb('rgb(253, 153, 67)'),
    Info: d3.rgb('rgb(52, 144, 156)'),
    OK: d3.rgb('lightsteelblue'),
    Invalid: d3.rgb('rgb(197, 197, 197)'),
    Timeout: d3.rgb('rgb(197, 197, 197)'),
  },
  "details": {
    "subject": {
      "heading": {
        "description": "Description",
        "tags": "Tags",
        "lastUpdated": "Last Updated",
        "relatedLinks": "Related Links"
      }
    },
    "sample": {
      "heading": {
        "description": "Description",
        "tags": "Tags",
        "lastUpdated": "Last Updated",
        "status": "Status",
        "message": "Message",
        "relatedLinks": "Related Links"
      }
    }
  },
  "pageHeader": {
    "legend": {
      "Critical": {
        "label": "Critical"
      },
      "Warning": {
        "label": "Warning"
      },
      "Info": {
        "label": "Info"
      },
      "OK": {
        "label": "OK"
      },
    }
  },
  "progress": {
    "heading": "Loading...",
    "label": "Loading..."
  }
};
