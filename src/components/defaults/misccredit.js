import React from 'react'
import PropTypes from 'prop-types'

const MiscCredit = ({ link, text }) => (
  <span className="font-awesome">
    <a href={link} rel="noopener noreferrer" target="_blank">
      {text}
    </a>
  </span>
)

MiscCredit.propTypes = {
  link: PropTypes.string,
  text: PropTypes.string,
}

export default MiscCredit