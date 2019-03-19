package com.testmaskin.android;

import android.database.Cursor;
import android.provider.ContactsContract;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.support.v7.widget.Toolbar;
import android.util.Log;
import android.webkit.CookieManager;
import android.webkit.CookieSyncManager;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.TextView;

import java.io.UnsupportedEncodingException;
import java.net.CookieHandler;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

public class MainActivity extends AppCompatActivity {

    WebView wv;
    String cookies = "Not logged in yet";
    private static final String TAG = "Main_activity";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        Toolbar myToolbar = findViewById(R.id.toolbar);
        setSupportActionBar(myToolbar);

        String uri = getIntent().getStringExtra("EXTRA_URI");
        String firstName = "Firstname";
        String lastName = "Lastname";



        CookieManager.getInstance().setAcceptCookie(true);


        wv = findViewById(R.id.web_view);
        wv.getSettings().setJavaScriptEnabled(true);
        wv.loadUrl(uri);
        wv.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished (WebView view, String url) {
                cookies = CookieManager.getInstance().getCookie(url);

                if (CookieManager.getInstance().getCookie(url) != null) {
                    String[] cookieParams = cookies.split(";");
                    String[] cookieValue = cookieParams[1].split("=");
                    cookies = cookieValue[1];

                    try {
                        cookies = URLDecoder.decode(cookies, "UTF-8");
                    } catch (UnsupportedEncodingException e) {
                        Log.e("Yourapp", "UnsupportedEncodingException");
                    }

                    Log.d("mail", cookies);
                }

//                Cursor emails = getContentResolver().query(ContactsContract.Data.CONTENT_URI, null, ContactsContract.CommonDataKinds.Email.ADDRESS + " = " + cookies, null, null);
//                while (emails.moveToNext()) {
//                    String emailAddress = emails.getString(
//                            emails.getColumnIndex(ContactsContract.CommonDataKinds.Email.DATA));
//
//                    Log.i("emails", emailAddress);
//                }
//                emails.close();

                TextView cookie = findViewById(R.id.toolbar_title);
                cookie.setText(cookies);

                Log.d("Cookies", " " + cookies);
            }
        });
    }

    @Override
    public boolean onKeyDown(int keyCode, android.view.KeyEvent event) {

        if (
                keyCode == android.view.KeyEvent.KEYCODE_BACK  &&
                        wv.canGoBack() ) {

            wv.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }
}
