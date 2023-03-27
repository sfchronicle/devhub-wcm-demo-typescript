import React from 'react'
import PropTypes from 'prop-types'

const Credits = ({ type, children }) => (
  <>
    <span>{type} by </span>
    {children}
  </>
)

Credits.propTypes = {
  type: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
}

export default Credits