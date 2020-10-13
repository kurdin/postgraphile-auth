import React from "react"
import { observer, inject } from "mobx-react"
import { Row, Col, Card, CardBody, CardTitle } from "reactstrap"
import AddPropertyButton from "../AddPropertyButton"
import ListProperties from "../ListProperties"

const Home = ({ renoTracker }) => {
  return (
    <div>
      {!renoTracker.hasProperties && (
        <Row className="h-100">
          <Col
            xs="12"
            className="d-flex align-items-center justify-content-center"
          >
            <Card className="p-3 d-inline-flex bg-glass text-center">
              <CardBody className="text-center">
                <CardTitle className="mb-4">Let's get started!</CardTitle>
                <AddPropertyButton
                  renoTracker={renoTracker}
                  title="Add my first reno"
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}
      {renoTracker.hasProperties && (
        <div className="app-layout__view-inner">
          <AddPropertyButton
            renoTracker={renoTracker}
            title="Add new reno"
            className="mb-3"
            size="md"
          />
          <ListProperties properties={renoTracker.activeProperties} />
        </div>
      )}
    </div>
  )
}

export default inject("renoTracker")(observer(Home))
