import React, { useState } from 'react'
import { Redirect } from 'react-router-dom'

import Logo from 'react-svg-loader!../assets/origin-logo.svg'
import store, { defaultState } from '@/store'

const LandingPage = () => {
  const [url, setUrl] = useState(null)
  const [clone, setClone] = useState(false)
  const [redirectTo, setRedirectTo] = useState(false)

  const handleStart = () => {
    store.update(() => defaultState)
    setRedirectTo('/edit')
  }

  const handleUrlSubmit = e => {
    e.preventDefault()
    setRedirectTo(`/process/${encodeURIComponent(url)}`)
  }

  if (redirectTo) {
    return <Redirect push to={redirectTo} />
  }

  return (
    <div className="landing-page">
      <div className="header">
        <div className="hero">
          <div className="hero-graphic">
            <div className="container">
              <div className="row">
                <div className="col">
                  <Logo className="my-5" />
                  <div className="float-right my-5">
                    <button
                      className="btn btn-primary"
                      onClick={() => setRedirectTo('/signin')}
                    >
                      Sign In
                    </button>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-12 col-lg-5">
                  <h1>
                    Build your
                    <br /> decentralized
                    <br /> shop.
                  </h1>
                  <h4>
                    Blockchain enabled.
                    <br />
                    No fees.
                    <br />
                    Own your data.
                    <br />
                  </h4>
                  <div className="my-5">
                    {!clone ? (
                      <>
                        <button
                          type="submit"
                          className="btn btn-primary btn-lg btn-block"
                          onClick={handleStart}
                        >
                          Get Started
                        </button>
                        <div className="my-3 text-center">
                          or clone an{' '}
                          <a href="#" onClick={() => setClone(true)}>
                            existing Shopify shop
                          </a>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-center">
                          Enter the URL of your Shopify shop
                        </p>
                        <form onSubmit={handleUrlSubmit}>
                          <div className="input-group">
                            <input
                              type="existingUrl"
                              className="form-control form-control-lg"
                              onChange={e => setUrl(e.target.value)}
                            />
                            <div className="input-group-append">
                              <button
                                type="submit"
                                className="btn btn-primary btn-block"
                                onClick={handleUrlSubmit}
                              >
                                Go
                              </button>
                            </div>
                          </div>
                        </form>
                        <div className="my-3 text-center">
                          or{' '}
                          <a href="#" onClick={() => setClone(false)}>
                            start from a blank canvas
                          </a>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage

require('react-styl')(`
.landing-page
  color: white
  .header
    color: white
    background-color: #111d28
    h1
      margin-bottom: 5rem
    h1, h4
      color: white
    h4
      font-weight: normal
  .hero-graphic
    background-image: url('images/creator-hero-graphic-clipped.png')
    background-position: bottom right
    min-height: 640px
    background-size: contain
    background-repeat: no-repeat

@media (max-width: 992px)
  .landing-page
    .hero-graphic
      background-image: none !important
`)
