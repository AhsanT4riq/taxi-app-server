## SheSafe backend api, 
based on - React Native Taxi App- Backend v4.1.1

Server System update Instructions:

Before starting ensure you have the AWS CLI installed, and have logged into the correct account/region

Rebuild the docker image with the updated code

`docker build -t shesafe/node-api .`

Tag the newly create docker image this is using the AWS container repository URL

`docker tag shesafe/node-api:latest 191502285040.dkr.ecr.ap-southeast-2.amazonaws.com/shesafe/node-api:latest`

Login to AWS

`aws ecr get-login --no-include-email`

Run the resulting command to login with a token

Push the updated Docker image to the container repository:
`docker push 191502285040.dkr.ecr.ap-southeast-2.amazonaws.com/shesafe/node-api:latest`

Open the ECV management console in AWS: Select Task Definitions -> SheSafeTestTask -> New Revision 
and complete the wizard, you do not need to change any values, this will create a new task

Go to the Cluster and Service tag - change the Task Definition to the one just created, check Force new deployment 
and complete the wizard.

[AWS Instructions](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/update-service.html)


Original Documentation
Follow the documentation to install and get started with the development:

-   [Documentation](https://docs.market.nativebase.io/react-native-taxi-app-with-backend/)
-   [Product Page](http://strapmobile.com/react-native-uber-like-app-backend/)

Happy coding!
