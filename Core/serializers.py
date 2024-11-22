from django.contrib.auth.models import User
from rest_framework import serializers
from django.contrib.auth import authenticate,login
from rest_framework_simplejwt.tokens import RefreshToken 
from .models import Partitura

class UserSerializer(serializers.ModelSerializer):
    class Meta:
      model = User
      fields = ['username','email','password']

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        user = User(
            email=validated_data['email'],
            username=validated_data['username']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    username_or_email = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    def validate(self, data):
        username_or_email = data.get("username_or_email")
        password = data.get("password")
        
        if username_or_email and password:
            # Intentar autenticar con nombre de usuario
            user = User.objects.filter(username = username_or_email).first()
            if not user:
                user= User.objects.filter(email = username_or_email).first()
                if not user:
                    raise serializers.ValidationError("Invalid username or email")
            
            user = authenticate(username = user.username, password = password)
            if user:
               pass
            else:
                raise serializers.ValidationError("Invalid password.")
        else:
            raise serializers.ValidationError("Must provide both username or email and password.")
        
        data["user"] = user
        return data


    def create(self, validated_data):
        user = validated_data['user']
        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
        
class PartitureSerializer(serializers.ModelSerializer):
      class Meta:
          model = Partitura
          fields = ['titulo','autor','descripcion','archivo','time_signature','clef','key_signature']
          read_only_fields = ['notas_transpuestas','notas_normales','time_signature','clef','key_signature']
          
      
      def create(self, validated_data):
           return Partitura.objects.create(**validated_data)