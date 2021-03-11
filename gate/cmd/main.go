package main

import (
	"github.com/ZupIT/charlescd/gate/internal/configuration"
	"log"
)

func main() {
	err := configuration.LoadConfigurations()
	if err != nil {
		log.Fatal(err)
	}

	persistenceManager, err := prepareDatabase()
	if err != nil {
		log.Fatal(err)
	}

	serviceManager, err := prepareServices()
	if err != nil {
		log.Fatal(err)
	}

	server, err := newServer(persistenceManager, serviceManager)
	if err != nil {
		log.Fatal(err)
	}

	log.Fatalln(server.start("8080"))
}
