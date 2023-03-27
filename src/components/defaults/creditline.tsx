import React, {useState} from 'react'
import PropTypes from 'prop-types'

const CreditLine = ({ name, email, twitter, instagram, organization}) => {
  const [showContact, setShowContact] = useState(false)

  return (
    <span className="contact-name" data-tip={JSON.stringify({email, twitter, instagram})} onClick={() => {
      setShowContact(!showContact)
    }}>
      {name}
      {organization && (
        <span>{' '}/{' '}{organization}</span>
      )}
    </span>
  )
}

CreditLine.propTypes = {
  name: PropTypes.string.isRequired,
  email: PropTypes.string,
  twitter: PropTypes.string,
}

export default CreditLine