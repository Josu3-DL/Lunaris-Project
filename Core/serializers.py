from django.contrib.auth.models import User
from rest_framework import serializers
from django.contrib.auth import authenticate,login
from rest_framework_simplejwt.tokens import RefreshToken 

class UserSerializer(serializers.ModelSerializer):
    class Meta:
      model = User
      fields = ['username','email','password']

    def create(self, validated_data):
        user = User(
            email=validated_data['email'],
            username=validated_data['username']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
      username = serializers.CharField(required=True)
      password = serializers.CharField(required=True, write_only=True)

      def validate(self, data):
            username = data.get("username")
            password = data.get("password")
            
            if username and password:
                  user = authenticate(username=username, password=password)
                  if user:
                        if not user.is_active:
                              raise serializers.ValidationError("User account is disabled.")
                  else:
                        raise serializers.ValidationError("Invalid credentials.")
            else:
                  raise serializers.ValidationError("Must provide both username and password.")
            
            data["user"] = user
            return data
            
      def create(self, validated_data):
            user = validated_data['user']
            refresh = RefreshToken.for_user(user)
            return {
            #si el acces token expira, refresh token
            #envia un nuevo acces token para evitar un
            #nuevo inicio de sesion
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            }
        
