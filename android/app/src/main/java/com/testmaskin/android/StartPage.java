package com.testmaskin.android;

import android.content.Intent;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;

public class StartPage extends AppCompatActivity {

    Button btLibrary;
    Button btLogin;
    Button btSinup;

    EditText defaulturi;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_start_page);

        defaulturi = findViewById(R.id.etUri);


        btLibrary = findViewById(R.id.library);
        btLibrary.setOnClickListener(new View.OnClickListener(){
            @Override
            public void onClick(View v){
                Intent i = new Intent(StartPage.this, MainActivity.class);
                Log.d("DefaultUri", "" + defaulturi.getText() );
                i.putExtra("EXTRA_URI", defaulturi.getText()  + "library.html");
                startActivity(i);
            }
        });

        btLogin = findViewById(R.id.login);
        btLogin.setOnClickListener(new View.OnClickListener(){
            @Override
            public void onClick(View v){
                Intent i = new Intent(StartPage.this, MainActivity.class);
                i.putExtra("EXTRA_URI", defaulturi.getText()  + "login.html");
                startActivity(i);
            }
        });

        btSinup= findViewById(R.id.signup);
        btSinup.setOnClickListener(new View.OnClickListener(){
            @Override
            public void onClick(View v){
                Intent i = new Intent(StartPage.this, MainActivity.class);
                i.putExtra("EXTRA_URI", defaulturi.getText()  + "signup.html");
                startActivity(i);
            }
        });
    }
}
