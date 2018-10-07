name := "play_test"
 
version := "1.0" 
      
lazy val `play_test` = (project in file(".")).enablePlugins(PlayJava)

resolvers += "scalaz-bintray" at "https://dl.bintray.com/scalaz/releases"

      
scalaVersion := "2.11.11"

libraryDependencies += guice
libraryDependencies ++= Seq( javaJdbc , cache , javaWs )
libraryDependencies += "com.google.code.gson" % "gson" % "2.8.0"
libraryDependencies += "org.webjars" % "bootstrap" % "3.3.6"



unmanagedResourceDirectories in Test <+=  baseDirectory ( _ /"target/web/public/test" )  

      